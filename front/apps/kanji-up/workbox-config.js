module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{png,ttf,jpg,svg,js,ico,html,json}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};