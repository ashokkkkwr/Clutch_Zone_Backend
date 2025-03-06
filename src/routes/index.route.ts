import { Router, type Request, type Response } from 'express'
import game from './games.route'
import tournament from './tournament.route'
import gear from './gear.route'
import team from './team.route'
import payment from './payment.route'
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
