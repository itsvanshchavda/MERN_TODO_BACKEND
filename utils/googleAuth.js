import { OAuth2Client } from "google-auth-library";

export const getGoogleProfile = async (token) => {

    const oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

    try {
    
        const userInfo = await oAuth2Client.request({
            url: "https://www.googleapis.com/auth/userinfo.profile",
            params: {
                access_token: token
            }
        });

        return userInfo.data;
    } catch (error) {
        console.error("Error fetching Google profile:", error.message);
        throw error;
    }
};


