export default [
	{
		ignores: ['node_modules/**', 'dist/**', 'build/**'],
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		rules: {},
	},
];
