let _accessToken: string | null = null

export const setAccessToken = (t: string | null) => { _accessToken = t }
export const getAccessToken = () => _accessToken
