import { userInfoQuery, skillsQuery, xpQuery } from "./query.js";
import { barChart, lineGraph } from "./graph.js";
const GRAPHQL_ENDPOINT = "https://01.gritlab.ax/api/graphql-engine/v1/graphql";
const SIGNIN_ENDPOINT = "https://01.gritlab.ax/api/auth/signin";

document.addEventListener("DOMContentLoaded", init);

function init() {
    // Event listners
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const identifier = e.target.identifier.value;
        const password = e.target.password.value;
        await loginUser(identifier, password)
    });

    document.getElementById("logout-btn").addEventListener("click", logoutUser);

    checkAuth();
}
/**
 * Checks if a valid JWT token exists in local storage
 * Shows profile if authenticated, or login form if not
 */
function checkAuth() {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
        showProfile(jwt);
    } else {
        showLoginForm();
    }
}
/**
 * Authenticates a user using provided credentials
 * Stores JWT token in local storage upon successful login
 * 
 * @async
 * @param {string} identifier - User's login identifier
 * @param {string} password - User's password
 * @returns {Promise<string|undefined>} Promise that resolves with JWT token or undefined if authentication fails
 */
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
/**
 * Logs user out by removing JTW from the localstorage
 * resets the UI to show login page
 */
function logoutUser() {
    localStorage.removeItem("jwt");
    document.getElementById("login-form").style.display = "block";
    document.getElementById("profile").style.display = "none";
    document.getElementById("xp-chart").style.display = "none";

    document.getElementById("login-container").style.display = "flex";
    document.getElementById("login-error").textContent = "";


    const skillChart = document.getElementById("skills-chart");
    if (skillChart) {
        skillChart.innerHTML = "";
    }
}
function showLoginForm() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("profile").style.display = "none";
    document.getElementById("xp-chart").style.display = "none";
}
/**
 * Displays user profile if JWT is valid
 * Validates token expiration and fetches user data
 * 
 * @param {string} token - JWT authentication token
 */
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
        // hide login
        document.getElementById("login-container").style.display = "none";

        // profile content
        document.getElementById("login-form").style.display = "none";
        document.getElementById("profile").style.display = "block";
        document.getElementById("xp-chart").style.display = "block";
        document.getElementById("logout-btn").style.display = "inline-block";

        fetchAndDisplayUserInfo();
        fetchAndDisplayXP();
        fetchAndDisplaySkills();

    } catch (err) {
        console.error("JWT validation failed:", err);
    }
}
/**
 * Fetches and displays user information from GraphQL API
 * Updates DOM elements with user data
 * 
 * @async
 * @returns {Promise<Object|undefined>} Promise that resolves when user data is fetched and displayed
 */
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
/**
 * Fetches and displays user XP data from GraphQL API
 * Filters relevant XP transactions and visualizes progression
 * 
 * @async
 * @returns {Promise<Object|undefined>} Promise that resolves when XP data is fetched, processed and displayed
 */
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

        lineGraph(progression);
    } catch (err) {
        console.error("Error fetching XP:", err);
    }
}
/**
 * Fetches and displays user skills data from GraphQL API
 * Creates a bar chart visualization of skills
 * 
 * @async
 * @returns {Promise<Object|undefined>} Promise that resolves when skills data is fetched and displayed
 */
async function fetchAndDisplaySkills() {
    try {
        const data = await graphqlQuery(skillsQuery);
        const skillTransactions = data?.user?.[0]?.skills || [];

        barChart(skillTransactions, "Skills", "skills-chart");

    } catch (err) {
        console.error("Error fetching skills:", err);
    }
}
/**
 * Executes a GraphQL query against the API endpoint
 * Uses JWT token for authorization
 * 
 * @async
 * @param {string} query - GraphQL query string
 * @returns {Promise<Object|undefined>} Query result data or undefined if error occurs
 */
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
