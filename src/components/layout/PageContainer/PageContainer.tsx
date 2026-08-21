
import './PageContainer.css'
type PageContainerProps = {
  children: React.ReactNode
}

function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <main className="page-container">
      {children}
    </main>
  )
}

export default PageContainer