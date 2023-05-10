const checkForValidURL = (url) => {
	return (
		url.includes("/channel/") ||
		url.includes("/c/") ||
		url.includes("/user/") ||
		url.includes("/watch?v=") ||
		url.includes("youtube.com/@")
	);
};
