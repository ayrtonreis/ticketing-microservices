import { buildClient } from '../api/build-client'

const LandingPage = ({ currentUser }) => {
  console.log({ a: '😵', currentUser })

  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  )
}

// this is called on the server during the Server Side Rendering (SSR) step
// It will be executed on the client if: navigating from one page to another while in the app
// LandingPage.getInitialProps = async ({ req }) => {
//   if (typeof window === 'undefined') {
//     const { data } = await axios.get(
//       'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
//       { headers: req.headers },
//     )
//     return data
//   } else {
//     const { data } = await axios.get('/api/users/currentuser')
//     return data
//   }
// }

export const getServerSideProps = async (context) => {
  const client = buildClient(context)
  const { data } = await client.get('/api/users/currentuser')
  return { props: data }
}

export default LandingPage