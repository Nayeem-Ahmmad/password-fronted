import {
  WhatsAppIcon,
  MailIcon,
  GitHubIcon,
  FacebookIcon,
  LinkedInIcon,
} from "./Icons";

const DEVELOPER = "Nayeem Ahmmad";
const PHONE = "01581270371";
const EMAIL = "nayeem.me.dev@outlook.com";

const LINKS = {
  whatsapp: "https://wa.me/8801581270371",
  email: `mailto:${EMAIL}`,
  github: "https://github.com/Nayeem-Ahmmad",
  facebook: "https://www.facebook.com/nayeemahmmad17",
  linkedin: "https://www.linkedin.com/in/nayem-hawladar/",
};

const SOCIALS = [
  { key: "github", label: "GitHub", href: LINKS.github, Icon: GitHubIcon },
  { key: "linkedin", label: "LinkedIn", href: LINKS.linkedin, Icon: LinkedInIcon },
  { key: "facebook", label: "Facebook", href: LINKS.facebook, Icon: FacebookIcon },
];

const COMPACT_ICONS = [
  { key: "whatsapp", label: "WhatsApp", href: LINKS.whatsapp, Icon: WhatsAppIcon },
  { key: "email", label: "Email", href: LINKS.email, Icon: MailIcon },
  ...SOCIALS,
];

const external = { target: "_blank", rel: "noopener noreferrer" };

function IconLink({ href, label, Icon }) {
  const isMail = href.startsWith("mailto:");
  return (
    <a
      className="icon-link"
      href={href}
      aria-label={label}
      title={label}
      {...(isMail ? {} : external)}
    >
      <Icon />
    </a>
  );
}

export default function Footer({ compact = false }) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="site-footer compact">
        <div className="social-row">
          {COMPACT_ICONS.map((item) => (
            <IconLink key={item.key} {...item} />
          ))}
        </div>
        <p className="footer-copy">
          &copy; {year} Personal Vault. All rights reserved.
        </p>
        <p className="footer-credit">
          Designed and developed by <strong>{DEVELOPER}</strong>
        </p>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="dev-card">
            <span className="dev-avatar" aria-hidden="true">
              NA
            </span>
            <div>
              <p className="dev-name">{DEVELOPER}</p>
              <p className="dev-role">Developer of Personal Password</p>
            </div>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <a className="contact-line" href={LINKS.whatsapp} {...external}>
              <WhatsAppIcon />
              <span>{PHONE}</span>
            </a>
            <a className="contact-line" href={LINKS.email}>
              <MailIcon />
              <span>{EMAIL}</span>
            </a>
          </div>

          <div className="footer-col">
            <h4>Find me online</h4>
            <div className="social-row">
              {SOCIALS.map((item) => (
                <IconLink key={item.key} {...item} />
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {year} Personal Password. All rights reserved.
          </p>
          <p className="footer-credit">
            Designed and developed by <strong>{DEVELOPER}</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}