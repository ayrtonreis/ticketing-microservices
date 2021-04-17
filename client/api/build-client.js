import axios from 'axios'

export const buildClient = ({req}) => {
  return axios.create({
    baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
    headers: req.headers
  })
}