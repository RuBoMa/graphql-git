import { userInfoQuery, skillsQuery } from "./query.js";
import { barChart } from "./graph.js";
const GRAPHQL_ENDPOINT = "https://01.gritlab.ax/api/graphql-engine/v1/graphql";

const jwt = localStorage.getItem("jwt");
// console.log("Stored JWT:", jwt);

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
        // console.log("JWT received from the login API:", jwt);
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

function showProfile(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
            console.error("JWT has expired!");
            localStorage.removeItem("jwt");
            document.getElementById("login-error").textContent = "Your session has expired. Please log in again.";
            return;
        }

        document.getElementById("login-form").style.display = "none";
        document.getElementById("profile").style.display = "block";
        document.getElementById("logout-btn").style.display = "inline-block";

        fetchAndDisplayUserInfo();
        fetchAndDisplayXP();
        fetchAndDisplaySkills();

    } catch (err) {
        console.error("JWT validation failed:", err);
    }
}

async function fetchAndDisplayUserInfo() {
    try {
        const data = await graphqlQuery(userInfoQuery);
        const user = data?.user?.[0];
        if (!user) return;

        document.getElementById("username").textContent = user.login;
        document.getElementById("userid").textContent = user.id;

        if (user.firstName && user.lastName) {
            let nameElement = document.getElementById("fullname");
            if (!nameElement) {
                nameElement = document.createElement("p");
                nameElement.id = "fullname";
                document.getElementById("profile").appendChild(nameElement);
            }
            nameElement.textContent = `${user.firstName} ${user.lastName} ID:${user.id}`;
        }

    } catch (err) {
        console.error("Error fetching user info:", err);
    }
}

async function fetchAndDisplayXP() {
    try {
        const data = await graphqlQuery(userInfoQuery);
        const xps = data?.user?.[0]?.xps || [];
        const filteredXP = xps.filter(xp => 
            (xp.path.startsWith('/gritlab/school-curriculum') && !xp.path.includes('/gritlab/school-curriculum/piscine-'))||
            (xp.path.endsWith('piscine-js'))
        );

        const totalXP = filteredXP.reduce((sum, xp) => sum + xp.amount, 0);

        let xpElement = document.getElementById("xp-info");
        if (!xpElement) {
            xpElement = document.createElement("div");
            xpElement.id = "xp-info";
            document.getElementById("xp-area").appendChild(xpElement);
        }
        xpElement.innerHTML = `
        <h3>XP</h3>
        <p>Total XP: ${totalXP.toLocaleString()}</p>
        `;
    barChart(filteredXP);

    } catch (err) {
        console.error("Error fetching XP:", err);
    }
}

async function fetchAndDisplaySkills() {
    try {
        const data = await graphqlQuery(skillsQuery);
        const skillTransactions = data?.user?.[0]?.skills || [];

        let skillsElement = document.getElementById("skills");
        if (!skillsElement) {
            skillsElement = document.createElement("div");
            skillsElement.id = "skills";
            document.getElementById("profile").appendChild(skillsElement);
        }

        skillsElement.innerHTML = "<h3>Skills</h3>";
        barChart(skillTransactions, "Skills", "skills-chart");

    } catch (err) {
        console.error("Error fetching skills:", err);
    }
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
    // console.log("Full GraphQL response:", result);
    if (result.errors) {
        console.error("GraphQL errors:", result.errors);
    }
    return result.data;
}
