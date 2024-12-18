document.addEventListener('DOMContentLoaded', () => { // Wait until the DOM is fully loaded before running the script
	const appContent = document.getElementById('page-content'); // Get the element where page content will be dynamically loaded
	// const navbar = document.getElementById('page-header'); // (Commented out) Get the element for the navigation bar
	// const footer = document.getElementById('page-footer'); // (Commented out) Get the element for the page footer

	// Function to handle navigation to different pages
	function navigateTo(path) {
		const pagePath = path === '/' ? '/home' : path; // Use '/home' for the root path or retain the provided path
		fetch("pages" + pagePath + pagePath + ".html") // Fetch the HTML content for the target page
			.then(response => {
				if (!response.ok) throw new Error('Page not found'); // If the response is not OK, throw an error
				return response.text(); // Convert the response to text (HTML content)
			})
			.then(html => {
				appContent.innerHTML = html; // Load the fetched HTML content into the page content element
                if(loggedIn && path == '/home') {
                    checkAndShowContent();
                }

				// Dynamically load the script for the page
				const scriptPath = "pages" + pagePath + pagePath + ".js"; // Construct the path to the JavaScript file for the page
				const scriptElement = document.createElement('script'); // Create a new script element
				scriptElement.src = scriptPath; // Set the source of the script to the constructed path
				scriptElement.onload = () => console.log(scriptPath + " loaded"); // Log a message when the script loads successfully
				scriptElement.onerror = () => console.warn(scriptPath + " not found"); // Warn if the script fails to load
				document.body.appendChild(scriptElement); // Append the script to the document body
			})
			.catch(() => {
				appContent.innerHTML = '<h1>404 - Page Not Found</h1>'; // Display a 404 message if the page or script is not found
			});
	}

	// Handle clicks on links with "data-route"
	document.querySelectorAll('a[data-route]').forEach(link => { // Select all links with the 'data-route' attribute
		link.addEventListener('click', event => { // Add a click event listener to each link
			event.preventDefault(); // Prevent the default browser navigation behavior
			var path = link.getAttribute('href'); // Get the 'href' attribute value of the clicked link
			console.log("PATH: ", path); // Log the path to the console

			history.pushState({}, '', path); // Update the browser history with the new URL

			// On click, navigate to the appropriate endpoint
			if (path === '/') navigateTo("/home"); // If the path is '/', navigate to '/home'
			else navigateTo(path); // Otherwise, navigate to the specified path
		});
	});



	// Load the initial route
	navigateTo(window.location.pathname === '/' ? '/login' : window.location.pathname); // (Commented out) Load the appropriate page for the initial route

    // Window variables to be access by other js files
    window.loggedIn = false;
    window.navigateTo = navigateTo;
});

// Function to toggle showing the query button and output text box for now
function checkAndShowContent() {
    const contentElement = document.querySelector('.query-content');
    
    if (contentElement && contentElement.style.display === 'none') {
        contentElement.style.display = '';
    }
}
