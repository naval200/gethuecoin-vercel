import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Wallet' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/redeem', label: 'Redeem' },
  { to: '/withdraw', label: 'Withdraw' },
];

function TopNav() {
  return (
    <nav className='topNav'>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => (isActive ? 'navLink navLinkActive' : 'navLink')}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default TopNav;
