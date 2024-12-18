document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('page-content');
    //const navbar = document.getElementById('page-header');
    //const footer = document.getElementById('page-footer');
  
  
    // Function to handle navigation to different pages
    function navigateTo(path) {
        const pagePath = path === '/' ? '/home' : path;
        fetch(`pages${pagePath}${pagePath}.html`)
            .then(response => {
                if (!response.ok) throw new Error('Page not found');
                return response.text();
            })
            .then(html => {
                appContent.innerHTML = html;
  
                // Dynamically load the script for the page
                const scriptPath = `pages${pagePath}${pagePath}.js`;
                const scriptElement = document.createElement('script');
                scriptElement.src = scriptPath;
                scriptElement.onload = () => console.log(`${scriptPath} loaded`);
                scriptElement.onerror = () => console.warn(`${scriptPath} not found`);
                document.body.appendChild(scriptElement);
            })
            .catch(() => {
                appContent.innerHTML = '<h1>404 - Page Not Found</h1>';
            });
    }
  
    // Handle clicks on links with `data-route`
    document.querySelectorAll('a[data-route]').forEach(link => {
        link.addEventListener('click', event => {
			event.preventDefault();
				var path = link.getAttribute('href');
				console.log("PATH: ", path)
				
				history.pushState({}, '', path);		// random bizarre crap

				// On click, navigate to appropriate endpoint.
				if(path === '/') navigateTo("/home");
				else             navigateTo(path);
				
        });
    });
   
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        navigateTo(window.location.pathname);
    });
  
    // Load the initial route
    //navigateTo(window.location.pathname === '/' ? '/home' : window.location.pathname); 
  }); 
