import { NavLink } from 'react-router-dom';

const links = [
  { to: '/redeem', label: 'Redeem HUE' },
  { to: '/withdraw', label: 'Withdraw USDC' },
  { to: '/transactions', label: 'Transactions' },
];

function TopNav() {
  return (
    <nav className='topNav' aria-label='Main'>
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
