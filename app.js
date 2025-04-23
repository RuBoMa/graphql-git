const userInfoQuery = `
{
  user {
    id
    login
    campus
    auditRatio
    totalUp
    totalDown
  }
}
`;
const GRAPHQL_ENDPOINT = "https://01.gritlab.ax/api/graphql-engine/v1/graphql";

const jwt = localStorage.getItem("jwt");
console.log("Stored JWT:", jwt);

if (jwt) {
    showProfile(jwt);
} else {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("profile").style.display = "none";
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = e.target.identifier.value;
    const password = e.target.password.value;
    // binary to ascii
    const credentials = btoa(`${identifier}:${password}`);

    try {
        const response = await fetch("https://01.gritlab.ax/api/auth/signin", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
            }
        });

        if (!response.ok) throw new Error("Invalid credentials");

        const jwt = await response.text();
        const cleanedJwt = jwt.replace(/"/g, "");
        localStorage.setItem("jwt", cleanedJwt);
        console.log("JWT received from the login API:", jwt);

        showProfile(jwt);

    } catch (err) {
        document.getElementById("login-error").textContent = err.message;
    }
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("jwt");
    document.getElementById("login-form").style.display = "block";
    document.getElementById("profile").style.display = "none";
})
function isValidJWT(token) {
    return token && token.split(".").length === 3;
}
function showProfile(token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds

    if (payload.exp < currentTime) {
        console.error("JWT has expired!");
        localStorage.removeItem("jwt");
        document.getElementById("login-error").textContent = "Your session has expired. Please log in again.";
        return;
    }

    document.getElementById("login-form").style.display = "none";
    document.getElementById("profile").style.display = "block";
    document.getElementById("logout-btn").style.display = "inline-block";

    document.getElementById("username").textContent = payload.login || "(unknown)";
    document.getElementById("userid").textContent = payload.id || payload.user_id;

    // call GraphQL to get user data
    graphqlQuery(userInfoQuery).then(data => {
        console.log("GraphQL response:", data);
        if (data && data.user && data.user.length > 0) {
            // Access the first user in the array
            const user = data.user[0]; 
            document.getElementById("username").textContent = user.login;
            document.getElementById("userid").textContent = user.id;
        } else {
            console.error("No user data found in GraphQL response");
        }
    }).catch(err => {
        console.error("GraphQL error:", err);
        document.getElementById("login-error").textContent = "GraphQL error: " + err.message;
    });
}

async function graphqlQuery(query) {
    const token = localStorage.getItem("jwt")?.trim();
    if (!token) {
        console.error("No JWT available for GraphQL request");
        return;
    }
    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
    });
    const result = await response.json();
    console.log("Full GraphQL response:", result);
    if (result.errors) {
        console.error("GraphQL errors:", result.errors);
    }
    return result.data;
}
