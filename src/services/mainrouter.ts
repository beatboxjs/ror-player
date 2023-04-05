import VueRouter, { RouteConfig } from 'vue-router'
import About from '../ui/overview/about'
import Listen from  '../ui/listen/listen'
import PatternPlayer from '../ui/pattern-player/pattern-player'
import TuneInfo from '../ui/tune-info/tune-info'

const routes : RouteConfig[] = [
    {
      name: 'about',
      path: '/',
      component: About
    },
    {
        path: '/listen',
        redirect: 'listen/General Breaks'
    },
    {
        path: '/listen/:tuneName',
        props: true,
        component: Listen,
        children:  [
            {
                name: 'listen',
                path: '',
                props: true,
                component: TuneInfo
            },
            {
            name: 'listen pattern',
            props: true,
            path: ':patternName',
            component: PatternPlayer
        }]
    }
  ]

  const router = new VueRouter({
    routes,
    mode: 'hash',
})

export default router