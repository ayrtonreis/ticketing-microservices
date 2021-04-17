import 'bootstrap/dist/css/bootstrap.css'
import { buildClient } from '../api/build-client'
import Header from '../components/header'

const AppComponent = ({ Component, pageProps }) => {
  console.log({ pageProps })
  return (
    <div>
      <Header currentUser={pageProps.currentUser}/>
      <Component {...pageProps} />
    </div>
  )
}

export const getServerSideProps = async (context) => {
  const client = buildClient(context)
  const { data } = await client.get('/api/users/currentuser')
  return { props: data }
}

// AppComponent.getInitialProps = async (appContext) => {
//   const client = buildClient(appContext.ctx)
//   const { data } = await client.get('/api/users/currentuser')
//
//   return data
// }

export default AppComponent