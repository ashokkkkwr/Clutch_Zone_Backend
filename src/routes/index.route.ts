import { Router, type Request, type Response } from 'express'
import game from './games.route'
import tournament from './tournament.route'
import gear from './gear.route'
import team from './team.route'
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
  }
]
routes.forEach((route) => {
  router.use(route.path, route.route)
})
router.get('/', (req: Request, res: Response) => {
  res.send({
    success: true,
    message: 'Welcome to NOTEFLOW API.',
  })
})
export default router
