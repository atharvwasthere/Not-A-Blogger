import os
import resend
import logging
from typing import List
from config import get_settings

# Setup settings
settings = get_settings()

# Setup logger
logger = logging.getLogger(__name__)

# Try to get API key from environment
resend.api_key = os.getenv("RESEND_API_KEY", "")


async def send_new_post_notification(
    post_title: str,
    post_excerpt: str,
    post_url: str,
    cover_image: str,
    subscribers: List[str],
):
    """
    Sends a new post notification email via Resend to all confirmed subscribers.
    """
    if not resend.api_key:
        logger.warning(
            "RESEND_API_KEY not found in environment. Skipping email notification."
        )
        return

    if not subscribers:
        logger.info("No subscribers found. Skipping email broadcast.")
        return

    # To avoid React Email rendering issues on Python backend,
    # we export an HTML string or use a simplified layout mirroring it.
    # The React code we wrote just now gives us the structure.
    # We will build a simplified HTML mapping for the backend to send.

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body {{ font-family: 'Inter', sans-serif; background-color: #f7f7f7; padding: 40px 0; margin: 0; }}
            .container {{ background-color: #ffffff; margin: 0 auto; max-width: 640px; padding: 40px 32px; }}
            .site-title {{ font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 400; letter-spacing: -0.5px; color: #111111; margin: 0 0 24px 0; line-height: 1.1; }}
            .author-title {{ font-size: 18px; color: #555555; margin: 0 0 12px 0; }}
            .author-subtitle {{ font-size: 14px; color: #888888; margin: 0 0 24px 0; max-width: 80%; line-height: 1.6; }}
            .author-writtenby {{ font-size: 14px; color: #111111; margin: 0; line-height: 1.6; }}
            .divider {{ border-top: 1px solid #e5e5e5; border-bottom: none; margin: 32px 0; }}
            .cover-image {{ width: 100%; border-radius: 0; margin-bottom: 24px; }}
            .post-title {{ font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; color: #111111; margin: 0 0 16px 0; line-height: 1.3; }}
            .post-excerpt {{ font-size: 16px; color: #444444; line-height: 1.7; margin: 0 0 24px 0; }}
            .btn {{ background-color: #0a0a0a; color: #ffffff; padding: 16px 24px; font-size: 15px; text-decoration: none; display: block; text-align: center; font-weight: 500; box-sizing: border-box; }}
            .footer-text {{ font-size: 13px; color: #777777; margin: 0 0 8px 0; line-height: 1.6; }}
            .footer-link {{ font-family: monospace; font-size: 13px; color: #111111; text-decoration: underline; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div>
                <h1 class="site-title">Not a Blogger</h1>
                <p class="author-title">I break systems so you don't have to.</p>
                <p class="author-subtitle">Notes on backend, systems, and things I build when I'm bored of tutorials.</p>
                <br>
                <p class="author-writtenby"><span style="color: #777777;">Written by</span><br><strong>Atharv Singh (not a blogger).</strong></p>
            </div>
            
            <hr class="divider">
            
            <div>
                {f'<img src="{cover_image}" alt="Post Cover" class="cover-image">' if cover_image else ""}
                <h2 class="post-title">{post_title}</h2>
                <p class="post-excerpt">{post_excerpt}</p>
                
                <div style="margin: 24px 0;">
                    <a href="{post_url}" class="btn">Read the full post →</a>
                </div>
            </div>
            
            <hr class="divider">
            
            <div>
                <p class="footer-text">Written by Atharv Singh.</p>
                <p class="footer-text">You're receiving this because you subscribed to Not a Blogger.</p>
                <a href="{settings.SITE_URL}/unsubscribe" class="footer-link">Unsubscribe</a>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        # Loop through batches of 50 (Resend limit per request is 50 subscribers)
        batch_size = 50
        for i in range(0, len(subscribers), batch_size):
            batch = subscribers[i : i + batch_size]

            params = {
                "from": "Atharv <newsletter@notablogger.com>",  # requires a verified domain in Resend
                "to": ["newsletter@notablogger.com"],  # The sender or a generic inbox
                "bcc": batch,
                "subject": f"{post_title} — Not a Blogger",
                "html": html_content,
            }

            # Send using resend API
            # For testing without a domain, you can only send to yourself
            response = resend.Emails.send(params)
            logger.info(f"Broadcast sent successfully: {response}")

    except Exception as e:
        logger.error(f"Failed to send email broadcast: {str(e)}")


async def send_welcome_email(email: str, subscriber_id: str, name: str = None):
    """
    Sends a welcome email to a new subscriber.
    """
    if not resend.api_key:
        logger.warning(
            "RESEND_API_KEY not found in environment. Skipping welcome email."
        )
        return

    greeting = f"Welcome, {name}." if name else "Welcome."
    unsubscribe_url = f"{settings.SITE_URL}/api/subscribers/unsubscribe/{subscriber_id}"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body {{ font-family: 'Inter', sans-serif; background-color: #f7f7f7; padding: 40px 0; margin: 0; }}
            .container {{ background-color: #ffffff; margin: 0 auto; max-width: 640px; padding: 40px 32px; }}
            .site-title {{ font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 400; letter-spacing: -0.5px; color: #111111; margin: 0 0 24px 0; line-height: 1.1; }}
            .author-title {{ font-size: 18px; color: #555555; margin: 0 0 12px 0; }}
            .author-subtitle {{ font-size: 14px; color: #888888; margin: 0 0 24px 0; max-width: 80%; line-height: 1.6; }}
            .author-writtenby {{ font-size: 14px; color: #111111; margin: 0; line-height: 1.6; }}
            .divider {{ border-top: 1px solid #e5e5e5; border-bottom: none; margin: 32px 0; }}
            .welcome-title {{ font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; color: #111111; margin: 0 0 16px 0; line-height: 1.3; }}
            .paragraph {{ font-size: 16px; color: #444444; line-height: 1.7; margin: 0 0 20px 0; }}
            .btn {{ background-color: #0a0a0a; color: #ffffff; padding: 16px 24px; font-size: 15px; text-decoration: none; display: block; text-align: center; font-weight: 500; box-sizing: border-box; }}
            .footer-text {{ font-size: 13px; color: #777777; margin: 0 0 8px 0; line-height: 1.6; }}
            .footer-link {{ font-family: monospace; font-size: 13px; color: #111111; text-decoration: underline; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div>
                <h1 class="site-title">Not a Blogger</h1>
                <p class="author-title">I break systems so you don't have to.</p>
                <p class="author-subtitle">Notes on backend, systems, and things I build when I'm bored of tutorials.</p>
                <br>
                <p class="author-writtenby"><span style="color: #777777;">Written by</span><br><strong>Atharv Singh (not a blogger).</strong></p>
            </div>
            
            <hr class="divider">
            
            <div>
                <h2 class="welcome-title">{greeting}</h2>
                <p class="paragraph">Thanks for subscribing to <strong>Not a Blogger</strong>. You are now on the list to receive my latest writings on backend systems, architectural trade-offs, and deliberate engineering.</p>
                <p class="paragraph">I don't publish on a strict schedule. I only hit send when I have something meaningful to say—usually deep dives into technical choices, hard-learned lessons from production, or essays on software design.</p>
                <p class="paragraph">You will receive the next essay as soon as it's published. Until then, you can explore the archive on the site.</p>
                
                <div style="margin: 24px 0;">
                    <a href="https://yourblog.com" class="btn">Visit the Archive →</a>
                </div>
            </div>
            
            <hr class="divider">
            
            <div>
                <p class="footer-text">Written by Atharv Singh.</p>
                <p class="footer-text">You're receiving this because you subscribed to Not a Blogger.</p>
                <a href="{unsubscribe_url}" class="footer-link">Unsubscribe</a>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        params = {
            "from": "Atharv <newsletter@notablogger.com>",  # requires verified domain
            "to": email,
            "subject": "Welcome to Not a Blogger",
            "html": html_content,
        }

        response = resend.Emails.send(params)
        logger.info(f"Welcome email sent successfully: {response}")
    except Exception as e:
        logger.error(f"Failed to send welcome email: {str(e)}")
