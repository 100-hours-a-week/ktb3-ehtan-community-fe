export async function __fetch(_path, _method, _body, _contentType = "application/json") {
    const accessToken = localStorage.getItem("access_token");
    const userIdToken = localStorage.getItem("user_id");
    return await fetch("http://localhost:8080" + _path, {
        method: _method,
        headers: {
            "Content-Type": _contentType,
            // ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
            ...(userIdToken ? { "access_token": userIdToken } : {})
        },
        body: JSON.stringify(_body)
    });
}

/*
일반 요청 api와 분리

엑세스/리프레쉬 토큰 전략 반영 후 엑세스 토큰 재발급용 fetch


export async function __reAuth() {
    return await fetch("http://localhost:8080/users/auth/token/refresh", {
        method: _method,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    });
}
    */


export async function __getFetch(_path, _body) {
    console.log(_path);
    return await __fetch(_path, "GET");
}

export async function __postFetch(_path, _body) {
    return await __fetch(_path, "POST", _body);
}

export async function __patchFetch(_path, _body) {
    return await __fetch(_path, "PATCH", _body);
}

export async function __deleteFetch(_path, _body) {
    return await __fetch(_path, "DELETE", _body);
}

export async function __uploadFile(_path, file) {
    const fd = new FormData();
    fd.append("file", file);
    
    return __fetch(_path, "POST", fd);
}
