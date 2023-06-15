import axios from "axios"

export const checkJwtTokenValidity = async (token: string) {
  axios.get('https://kanjiup-auth.alexandre-em.fr/session/check', {
    headers: { Authorization: `Bearer ${token}` }
})
}
