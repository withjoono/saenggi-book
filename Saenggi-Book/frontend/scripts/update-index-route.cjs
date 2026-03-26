const fs = require('fs');

const indexRouteContent = `import { ServiceCardsPage } from "@/components/service-cards-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <ServiceCardsPage />;
}
`;

fs.writeFileSync('src/routes/index.tsx', indexRouteContent, 'utf8');
console.log('Index route updated successfully!');
