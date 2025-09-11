import { SimpleSidebar } from '../components/SimpleSidebar'
import { SocialFeed } from '../components/SocialFeed'
import { ModularLayout } from '../components/ModularLayout'
import { TrendingEvents } from '../modules/TrendingEvents'
import { SuggestedFriends } from '../modules/SuggestedFriends'

export default function HomePage() {
  // Configure which modules to show on the right sidebar
  const rightModules = [
    <TrendingEvents key="trending" />,
    <SuggestedFriends key="friends" />
  ]

  return (
    <ModularLayout
      leftSidebar={<SimpleSidebar />}
      mainContent={<SocialFeed />}
      rightModules={rightModules}
      showRightSidebar={true}
    />
  )
}