import { userInfoQuery, skillsQuery, xpQuery } from "./query.js";
import { barChart, lineGraph } from "./graph.js";
const GRAPHQL_ENDPOINT = "https://01.gritlab.ax/api/graphql-engine/v1/graphql";
const SIGNIN_ENDPOINT = "https://01.gritlab.ax/api/auth/signin";

const jwt = localStorage.getItem("jwt");
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

    await loginUser(identifier, password)
});
document.getElementById("logout-btn").addEventListener("click", logoutUser);

async function loginUser(identifier, password) {
    const credentials = btoa(`${identifier}:${password}`);

    try {
        const response = await fetch(SIGNIN_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
            }
        });

        if (!response.ok) throw new Error("Invalid credentials");

        const jwt = await response.text();
        const cleanedJwt = jwt.replace(/"/g, "");
        localStorage.setItem("jwt", cleanedJwt);
        showProfile(jwt);
    } catch (err) {
        document.getElementById("login-error").textContent = err.message;
    }
}
    
function logoutUser(){
    localStorage.removeItem("jwt");
    document.getElementById("login-form").style.display = "block";
    document.getElementById("profile").style.display = "none";
    document.getElementById("xp-chart").style.display = "none";

    const skillChart = document.getElementById("skills-chart");
    if (skillChart) {
        skillChart.innerHTML = "";
    }
}
    

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

        document.getElementById("audit-ratio").textContent = `Audit Ratio: ${(user.auditRatio * 1).toFixed(1)}`;
        document.getElementById("email").textContent = `Email: ${user.attrs?.email}`;
        document.getElementById("campus").textContent = `Campus: ${user.campus}`;
        document.getElementById("nationality").textContent = `Nationality: ${user.attrs?.nationality}`;
        document.getElementById("fullname").textContent = `Name: ${user.firstName} ${user.lastName}`;

    } catch (err) {
        console.error("Error fetching user info:", err);
    }
}

async function fetchAndDisplayXP() {
    try {
        const data = await graphqlQuery(xpQuery);
        const transaction = data?.transaction || [];

        const filteredXP = transaction.filter(xp =>
            (xp.path.startsWith('/gritlab/school-curriculum') && !xp.path.includes('/gritlab/school-curriculum/piscine-')) ||
            xp.path.endsWith('piscine-js')
        );

        const sortedXP = filteredXP.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const progression = [];
        let cumulative = 0;
        for (const xp of sortedXP) {
            cumulative += xp.amount;
            progression.push({
                amount: cumulative,
                createdAt: xp.createdAt
            });
        }

        const totalXP = cumulative;
        const totalKB = totalXP / 1000;
        document.getElementById("total-xp").textContent =
            `${totalKB.toLocaleString(undefined, { maximumFractionDigits: 0 })} KB`;

        // let chartContainer = document.getElementById("xp-chart");
        // chartContainer.style.display = "block";
        // chartContainer.innerHTML = "";
        lineGraph(progression);
    } catch (err) {
        console.error("Error fetching XP:", err);
    }
}

async function fetchAndDisplaySkills() {
    try {
        const data = await graphqlQuery(skillsQuery);
        const skillTransactions = data?.user?.[0]?.skills || [];

        // const chartContainer = document.getElementById("skills-chart");
        // chartContainer.innerHTML = "";

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
    if (result.errors) {
        console.error("GraphQL errors:", result.errors);
    }
    return result.data;
}
