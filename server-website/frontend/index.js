/*
 * Listener for handling running the scripts and functions when the page loads
 * Handles doing any setup necessary to make sure the user navigates properly
 */
document.addEventListener('DOMContentLoaded', function () {

	// Initialize global variables/functions
	window.loggedIn = isLoggedIn();
	window.navigateTo = navigateTo;

	// Handle the initial page load
	handleInitialRoute();

	// Update the navbar/header UI based on login status
	toggleNavbarLoginRegister();
});

/*
 * Navigate to a specified path, dynamically loading its content and associated script.
 * @param {string} path - The path to navigate to (example: '/home', '/login)
*/
async function navigateTo(path) {
	try {
		// If path is '/' then go to /home by default
		let pagePath;
		if(path === '/') {
			pagePath = '/home';
		}
		// Otherwise, go to the path defined
		else {
			pagePath = path;
		}

		// Construct the URL to fetch the html page
		const pageUrl = 'pages' + pagePath + pagePath + '.html';
		console.log("Navigating to:", pageUrl);

		// Fetch the page content
		const response = await fetch(pageUrl);
		if(!response.ok) {
			throw new Error('Page not found');
		}

		// Update the page-content with the html file
		const html = await response.text();
		updatePageContent(html);

		// Load in the corresponding javascript file
		loadPageScript(pagePath);

		// Store the last page the user was on, for refreshing page purposes
		localStorage.setItem('currentPage', pagePath)

		// Push the state to history, to work with back and forward arrows
		history.replaceState({ path: pagePath }, '', location.href); 
	}
	// Throw a 404 error on the screen if the html file couldnt be found
	catch(error) {
		console.error(error.message);
		updatePageContent(`
			<h1>404 - Page Not Found</h1>
			<p> Contact RuntTimeTerror@linux.com for assitance! </p>
			<p> It sucks, but please provide the Case Number here: 123421 </p>
			`);
	}
}

/*
 * Update the content of the main content for the page
 * @param {string} html - The HTML content to display
*/
function updatePageContent(html) {
	// Reference the page-content element and put the new html in the element
	const appContent = document.getElementById('page-content');
	appContent.innerHTML = html;

	// If the user is logged in, check if the navbar needs to be updated to shown new buttons
	if(window.loggedIn) {
		checkAndShowContent();
	}
}

/*
 * Dynamically load the JavaScript file for the specified page
 * @param {string} pagePath - The path to the JavaScript file
*/
function loadPageScript(pagePath) {
	// Constructs path to the scripts
	const scriptPath = 'pages' + pagePath + pagePath + '.js';
	const scriptElement = document.createElement('script');
	scriptElement.src = scriptPath;

	// Loads the script and any errors that occur
	scriptElement.onload = () => console.log(scriptPath, 'loaded');
	scriptElement.onerror = () => console.error(scriptPath, 'not found');

	// Append the javascript file to the scriptElement 
	document.body.appendChild(scriptElement);
}

/*
 * Handle the intial page load based on the login status and current path
*/
function handleInitialRoute() {
	// Function to JWT token
	const jwt = getCookie('jwt');

	// Checks for last page visited, for page refreshse
	const lastVisitedPage = localStorage.getItem('currentPage');

	// If lastVisitedPage exists, go to that page
	if(lastVisitedPage) {
		navigateTo(lastVisitedPage);
	}
	// If no JWT(not logged in), go to /login
	else if(!jwt) {
		navigateTo('/login')
	} 
	// If user is logged in, go to /home
	else if(window.loggedIn) {
		navigateTo('/home')
	}

}

/*
 * Get the value of a specific cookie by name
 * @param {string} name - The name of the cookie to get
 * @returns {string|null} - The cookie value, or null if not found
*/
function getCookie(name) {
	// Reference the cookies in the document
	const cookieString = document.cookie;
	const cookies = cookieString.split('; ');

	// Go through the cookies until you find the one with the correct name (jwt in our case)
	for (const cookie of cookies) {
		const [key, value] = cookie.split('=');
		if (key === name) {
			return value;
		}
	}
	return null;
}

/*
 * Check if the user is logged in by verifying te presence of a JWT cookie
 * @returns {boolean} - True if logged in, false otherwise.
*/
function isLoggedIn() {
	// Gets the JWT cookie nad returns it if found, otherwise null
	const token = getCookie('jwt'); 
	return token !== null;
}

/*
 * Function to toggle the login/register buttons on the navbar
 * Disables login/register buttons if user is logged in and shows account/logout
 */
function toggleNavbarLoginRegister() {
	// Make a reference to both sets up buttons (references the div they are in)
	const accountInfo = document.querySelector('.account-info');
	const loginRegister = document.querySelector('.login-register')

	// If the user is logged in, display the accountInfo div and hide the loginRegister div
	if (isLoggedIn()) {
		accountInfo.style.display = 'block';
		loginRegister.style.display = 'none';
	// Else, do the opposite
	} else {
		accountInfo.style.display = 'none';
		loginRegister.style.display = 'block';
	}
}

/*
 * Fuction to log the user out
 */
function logout() {
    // Clear the JWT cookie by setting it with an expired date
    document.cookie = 'jwt=; Max-Age=0; path=/';
	// Remove the 'currentPage' from the localstorage
	localStorage.removeItem('currentPage');
	// Set the logged in state to false
	window.loggedIn = false;

    // Update the navbar to reflect logout
    toggleNavbarLoginRegister();

	// Navigate the user back to the login page
	navigateTo('/login');
}


/*
 * Function to toggle showing the query button and output text box, until the user is logged in
 */
function checkAndShowContent() {
	// Makes reference to the div used to display the query button and text box
    const contentElement = document.querySelector('.query-content');
	const contentElement2 = document.querySelector('.terminal-div');
	
    
	// If the 'style: display' is set to none, then change it to
    if (contentElement && contentElement.style.display === 'none') {
        contentElement.style.display = 'block';
    }
	if (contentElement2 && contentElement2.style.display === 'none') {
        contentElement2.style.display = 'block';
    }
}

/*
 * Listener to handle the popstate for using the back and forward page buttons
 * Uses the state history to navigate to pages without changing the url, but still dynamically loading pages 
 */
window.addEventListener('popstate', function(event) {
    // Get the state data
    const state = event.state;

    if (state && state.path) {
        // Navigate to the correct page based on the state
        navigateTo(state.path);
    }
});
