module.exports = {
	secret: process.env.JWT_SECRET || "change-me",
	expiresIn: "1d",
	cookieName: "token",
};
