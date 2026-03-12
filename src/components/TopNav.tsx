import { NavLink } from 'react-router-dom';

import type { AuthSource } from '../lib/storage';

const links = [
  { to: '/', label: 'Wallet' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/redeem', label: 'Redeem' },
  { to: '/withdraw', label: 'Withdraw' },
];

interface TopNavProps {
  authSource: AuthSource;
  onClearToken: () => void;
  onLogout: () => void;
}

function TopNav({ authSource, onClearToken, onLogout }: TopNavProps) {
  return (
    <nav className='topNav'>
      <div className='topNavLeft'>
        {authSource === 'url' && (
          <button type='button' className='navLink secondaryBtn' onClick={onClearToken}>
            Back
          </button>
        )}
      </div>
      <div className='topNavCenter'>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'navLink navLinkActive' : 'navLink')}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className='topNavRight'>
        {authSource === 'webapp' && (
          <button type='button' className='navLink secondaryBtn' onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default TopNav;
