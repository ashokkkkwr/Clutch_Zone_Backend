import { Router, type Request, type Response } from 'express'
import game from './games.route'
import tournament from './tournament.route'
import gear from './gear.route'
import team from './team.route'
import payment from './payment.route'
import profile from './profile.route'
import scoreSubmission from './scoreSubmisson.route'
import dashboard from './dashboard.route'
import favourite from './favourite.route'
import user from './user.routes'
export interface Route {
  path: string
  route: Router
}
const router = Router()
const routes: Route[] = [
  {
    path: '/game',
    route: game,
  },
  {
path: '/user',
route: user
  },
  {
    path: '/tournament',
    route: tournament,
  },
  {
    path:'/gear',
    route:gear,
  },
  {
    path:'/team',
    route:team
  },
  {
    path:'/payment',
    route:payment
  },
  {
    path:'/profile',
    route:profile
  },
  {
    path:'/scoreSubmission',
    route:scoreSubmission
  },
  {
    path:'/dashboard',
    route:dashboard
  },
  {
    path:'/favourite',
    route:favourite
  }
]
routes.forEach((route) => {
  router.use(route.path, route.route)
})
router.get('/', (req: Request, res: Response) => {
  res.send({
    success: true,
    message: 'Welcome to ClutchZone  API.',
  })
})
export default router
