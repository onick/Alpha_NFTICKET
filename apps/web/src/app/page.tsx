import { SimpleSidebar } from '../components/SimpleSidebar'
import { SimpleFeed } from '../components/SimpleFeed'
import { ModularLayout } from '../components/ModularLayout'
import { TrendingEvents } from '../modules/TrendingEvents'

export default function HomePage() {
  // Configure which modules to show on the right sidebar
  const rightModules = [
    <TrendingEvents key="trending" />
  ]

  return (
    <ModularLayout
      leftSidebar={<SimpleSidebar />}
      mainContent={<SimpleFeed />}
      rightModules={rightModules}
      showRightSidebar={true}
    />
  )
}