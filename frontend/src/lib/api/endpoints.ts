import client from './client'

export const authAPI = {
  register: (data: any) => client.post('/accounts/register/', data),
  login: (data: any) => client.post('/accounts/login/', data),
  refreshToken: (refresh: string) => client.post('/accounts/token/refresh/', { refresh }),
  profile: () => client.get('/accounts/profile/'),
}

export const mahasiswaAPI = {
  getList: (params?: any) => client.get('/mahasiswa/', { params }),
  getLatest: () => client.get('/mahasiswa/latest/'),
  getMostViewed: () => client.get('/mahasiswa/most-viewed/'),
  getMyProfile: () => client.get('/mahasiswa/my-profile/'),
  getDetail: (id: number) => client.get(`/mahasiswa/${id}/`),
  create: (data: any) => client.post('/mahasiswa/', data),
  update: (id: number, data: any) => client.put(`/mahasiswa/${id}/`, data),
  trackView: (id: number) => client.post(`/mahasiswa/${id}/view/`),
  downloadCV: (id: number) => client.get(`/mahasiswa/${id}/download-cv/`, { responseType: 'blob' }),
  getQRCode: (id: number, download = false) => client.get(`/mahasiswa/${id}/qr-code/`, { params: { download }, responseType: 'blob' }),
  getProfileCompletion: () => client.get('/mahasiswa/profile-completion/'),
}

export const skillsAPI = {
  getList: () => client.get('/skills/'),
  create: (data: any) => client.post('/skills/', data),
  endorse: (id: number) => client.post(`/skills/${id}/endorse/`),
  removeEndorsement: (id: number) => client.delete(`/skills/${id}/endorse/`),
}

export const talentsAPI = {
  getList: () => client.get('/talents/'),
  create: (data: any) => client.post('/talents/', data),
}