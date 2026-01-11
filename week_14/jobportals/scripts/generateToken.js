require('dotenv').config();
const jwt = require('jsonwebtoken');

// simple argv parsing: --id=1 --role=ADMIN
const args = process.argv.slice(2);
const argv = {};
args.forEach(a => {
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    argv[k] = v === undefined ? true : v;
  }
});

const id = argv.id || argv.u || argv.user;
const role = argv.role || 'MEMBER';
if (!id) {
  console.error('Usage: node scripts/generateToken.js --id=<userId> [--role=ADMIN|MEMBER]');
  process.exit(1);
}

const secret = process.env.JWT_SECRET || 'dev-secret';
const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

const token = jwt.sign({ id: Number(id), role }, secret, { expiresIn });
console.log(token);
