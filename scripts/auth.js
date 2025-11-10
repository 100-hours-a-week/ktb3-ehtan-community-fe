export function isLoggedIn() {
    return (
        localStorage.getItem("access_token") &&
        localStorage.getItem("user_id")
    );
}