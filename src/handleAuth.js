const profile = JSON.parse(localStorage.getItem("profile"));
const profileParams = getProfileParams();
const loggoutBtn = document.getElementById("logout");

//event listener for loggout button
loggoutBtn.addEventListener("click", loggout);

function loggout() {
    localStorage.removeItem("profile");
    window.location.href =
        "https://auth-intevolution.azurewebsites.net/api/logout";
}

function getProfileParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.size === 0) {
        return null;
    }
    return {
        email: params.get("email"),
        name: params.get("name"),
        access_token: params.get("access_token"),
        refresh_token: params.get("refresh_token"),
        expires_in: params.get("expires_in"),
    };
}

function init() {
    //redirect to login page if no profile or profileParams
    if (!profile && !profileParams) {
        redirectToLogin();
    }
    //save profile to localStorage
    if (profileParams) {
        saveProfile(profileParams);
    }

    //if profile is in localStorage, validate token
    if (profile) {
        validateToken(profile);
    }
}

function saveProfile(profile) {
    localStorage.setItem("profile", JSON.stringify(profile));
    window.history.replaceState({}, document.title, window.location.pathname);
}

async function validateToken(profile) {
    try {
        let res = await axios({
            method: "get",
            maxBodyLength: Infinity,
            url: "https://auth-intevolution.azurewebsites.net/api/validateToken",
            headers: {
                Authorization: "Bearer " + profile.access_token,
            },
        });

        let resCode = res.data.code;
        switch (resCode) {
            case "00":
                //token is valid, no action needed
                return true;
            case "02":
                //token invalid, reroute to login page
                redirectToLogin();
                return false;
            case "03":
                //token expired, refresh token
                refreshAccessToken(profile);
                return false;

            default:
                redirectToLogin();
                return false;
        }
    } catch (error) {
        console.error("Error validating token", error);
        redirectToLogin();
    }
}

async function refreshAccessToken(profile) {
    try {
        let data = {
            refresh_token: profile.refresh_token,
        };

        let res = await axios({
            method: "post",
            url: "https://auth-intevolution.azurewebsites.net/api/refreshToken",
            data: JSON.stringify(data),
        });

        let resCode = res.data.code;

        switch (resCode) {
            case "00":
                let profile = res.data.profile;
                saveProfile(profile);
                break;

            case "01":
                //refresh token invalid, reroute to login page
                redirectToLogin();
                break;

            default:
                redirectToLogin();

                break;
        }
    } catch (error) {
        console.error("Error refreshing token", error);
        redirectToLogin();
    }
}

function redirectToLogin() {
    window.location.href =
        "https://auth-intevolution.azurewebsites.net/api/login";
}

init();
