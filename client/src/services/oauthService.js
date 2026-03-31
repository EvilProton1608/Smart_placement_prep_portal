import API from "./api";

export const googleAuth = (googleData) => {
  return API.post("/oauth/google", {
    email: googleData.email,
    name: googleData.name,
    picture: googleData.picture,
    googleId: googleData.sub, // 'sub' is Google's unique identifier
  });
};

export const githubAuth = (githubData) => {
  return API.post("/oauth/github", {
    email: githubData.email,
    name: githubData.name,
    githubId: githubData.id,
    avatarUrl: githubData.avatar_url,
  });
};
