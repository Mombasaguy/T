import Stripe from 'stripe';

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const connectorName = 'stripe';
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', connectorName);
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }

  return connectionSettings.settings.secret;
}

async function seedProducts() {
  console.log('Getting Stripe credentials...');
  const secretKey = await getCredentials();
  
  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil' as any,
  });

  console.log('Creating products in Stripe...');

  const existingProducts = await stripe.products.list({ limit: 100 });
  const existingNames = existingProducts.data.map(p => p.name);

  if (!existingNames.includes('Professional Plan')) {
    const professionalProduct = await stripe.products.create({
      name: 'Professional Plan',
      description: 'Everything you need for serious recruiting - 200 searches/month, AI emails, Find Similar, advanced filters',
      metadata: {
        plan: 'professional',
        searches_per_month: '200',
      },
    });

    const professionalPrice = await stripe.prices.create({
      product: professionalProduct.id,
      unit_amount: 9900,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { plan: 'professional' },
    });

    console.log('Created Professional Plan:');
    console.log('  Product ID:', professionalProduct.id);
    console.log('  Price ID:', professionalPrice.id);
    console.log('');
    console.log('Add this to your .env or Replit Secrets:');
    console.log(`  VITE_STRIPE_PRICE_PROFESSIONAL=${professionalPrice.id}`);
  } else {
    console.log('Professional Plan already exists, skipping...');
  }

  if (!existingNames.includes('Team Plan')) {
    const teamProduct = await stripe.products.create({
      name: 'Team Plan',
      description: 'For growing recruiting teams - 1000 searches/month, up to 10 members, team collaboration',
      metadata: {
        plan: 'team',
        searches_per_month: '1000',
        team_members: '10',
      },
    });

    const teamPrice = await stripe.prices.create({
      product: teamProduct.id,
      unit_amount: 29900,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { plan: 'team' },
    });

    console.log('Created Team Plan:');
    console.log('  Product ID:', teamProduct.id);
    console.log('  Price ID:', teamPrice.id);
    console.log('');
    console.log('Add this to your .env or Replit Secrets:');
    console.log(`  VITE_STRIPE_PRICE_TEAM=${teamPrice.id}`);
  } else {
    console.log('Team Plan already exists, skipping...');
  }

  console.log('');
  console.log('Done! Products are now available in your Stripe dashboard.');
  console.log('Webhooks will automatically sync them to your database.');
}

seedProducts().catch(console.error);
