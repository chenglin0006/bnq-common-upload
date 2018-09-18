export default (args) => {
    //判断当前环境
    let params = args.type.toUpperCase() === 'GET' ? null : args.param;
    let headers = {
        'Accept': 'application/json',
        'Content-Type': args.contentType || 'application/json',
    }

    return fetch(args.url, {
        credentials: 'include', // 请求带上cookies，是每次请求保持会话一直
        method: args.type.toUpperCase(),
        follow: 1,
        timeout: 10000,
        headers: headers,
        body: params ? JSON.stringify({
            "data": params
        }) : null
    }).then((res) => {
        if (res.status >= 200 && res.status < 300) {
            return res;
        }
        const error = new Error(res.statusText);
        error.res = res;
        throw error;
    }).then((response) => {
        return response.json();
    });
}
