import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Font,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    subscriberName?: string;
    authorName: string;
}

export const WelcomeEmail = ({
    subscriberName,
    authorName = "Atharv Singh",
}: WelcomeEmailProps) => {
    const previewText = `Welcome to Not a Blogger`;

    return (
        <Html>
            <Head>
                <Font
                    fontFamily="Playfair Display"
                    fallbackFontFamily="serif"
                    webFont={{
                        url: "https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff2",
                        format: "woff2",
                    }}
                    fontWeight={600}
                    fontStyle="normal"
                />
                <Font
                    fontFamily="Inter"
                    fallbackFontFamily="sans-serif"
                    webFont={{
                        url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2",
                        format: "woff2",
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
                <Font
                    fontFamily="JetBrains Mono"
                    fallbackFontFamily="monospace"
                    webFont={{
                        url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOVQw.woff2",
                        format: "woff2",
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={headerSection}>
                        <Heading style={siteTitle}>Not a Blogger</Heading>
                        <Text style={authorLineTitle}>
                            I break systems so you don't have to.
                        </Text>
                        <Text style={authorLineSubtitle}>
                            Notes on backend, systems, and things I build when I'm bored of tutorials.
                        </Text>
                        <br />
                        <Text style={authorLineWrittenBy}>
                            <span style={{ color: "#777777" }}>Written by</span><br />
                            <strong>{authorName} (not a blogger).</strong>
                        </Text>
                    </Section>

                    <Hr style={divider} />

                    {/* Content */}
                    <Section style={contentSection}>
                        <Heading as="h2" style={welcomeTitleStyle}>
                            {subscriberName ? `Welcome, ${subscriberName}.` : "Welcome."}
                        </Heading>

                        <Text style={paragraphStyle}>
                            Thanks for subscribing to <strong>Not a Blogger</strong>. You are now on the list to receive my latest writings on backend systems, architectural trade-offs, and deliberate engineering.
                        </Text>

                        <Text style={paragraphStyle}>
                            I don't publish on a strict schedule. I only hit send when I have something meaningful to say—usually deep dives into technical choices, hard-learned lessons from production, or essays on software design.
                        </Text>

                        <Text style={paragraphStyle}>
                            You will receive the next essay as soon as it's published. Until then, you can explore the archive on the site.
                        </Text>

                        <Section style={buttonContainer}>
                            <Button style={button} href="https://yourblog.com">
                                Visit the Archive →
                            </Button>
                        </Section>
                    </Section>

                    <Hr style={divider} />

                    {/* Footer */}
                    <Section style={footerSection}>
                        <Text style={footerText}>
                            Written by {authorName}.
                        </Text>

                        <Text style={footerText}>
                            You’re receiving this because you subscribed to Not a Blogger.
                        </Text>

                        <Link href="{{unsubscribe_url}}" style={footerLink}>
                            Unsubscribe
                        </Link>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default WelcomeEmail;

/* ---------------- STYLES ---------------- */

const main = {
    backgroundColor: "#f7f7f7",
    fontFamily:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    padding: "40px 0",
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "640px",
    padding: "40px 32px",
};

const headerSection = {
    textAlign: "left" as const,
};

const siteTitle = {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: "48px",
    fontWeight: "400",
    letterSpacing: "-0.5px",
    color: "#111111",
    margin: "0 0 24px 0",
    lineHeight: "1.1",
};

const authorLineTitle = {
    fontFamily: '"Inter", sans-serif',
    fontSize: "18px",
    fontWeight: "400",
    color: "#555555",
    margin: "0 0 12px 0",
    lineHeight: "1.5",
};

const authorLineSubtitle = {
    fontFamily: '"Inter", sans-serif',
    fontSize: "14px",
    fontWeight: "400",
    color: "#888888",
    margin: "0 0 24px 0",
    lineHeight: "1.6",
    maxWidth: "80%",
};

const authorLineWrittenBy = {
    fontFamily: '"Inter", sans-serif',
    fontSize: "14px",
    fontWeight: "400",
    color: "#111111",
    margin: "0",
    lineHeight: "1.6",
};

const divider = {
    borderColor: "#e5e5e5",
    margin: "32px 0",
};

const contentSection = {};

const welcomeTitleStyle = {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: "26px",
    fontWeight: "600",
    color: "#111111",
    margin: "0 0 16px 0",
    lineHeight: "1.3",
};

const paragraphStyle = {
    fontFamily: '"Inter", sans-serif',
    fontSize: "16px",
    color: "#444444",
    lineHeight: "1.7",
    margin: "0 0 20px 0",
};

const buttonContainer = {
    margin: "24px 0",
};

const button = {
    fontFamily: '"Inter", sans-serif',
    backgroundColor: "#0a0a0a",
    color: "#ffffff",
    padding: "16px 24px",
    fontSize: "15px",
    textDecoration: "none",
    borderRadius: "0px",
    display: "block",
    textAlign: "center" as const,
    fontWeight: "500",
    width: "100%",
    boxSizing: "border-box" as const,
};

const footerSection = {
    textAlign: "left" as const,
};

const footerText = {
    fontFamily: '"Inter", sans-serif',
    fontSize: "13px",
    color: "#777777",
    margin: "0 0 8px 0",
    lineHeight: "1.6",
};

const footerLink = {
    fontFamily: '"JetBrains Mono", Courier, monospace',
    fontSize: "13px",
    color: "#111111",
    textDecoration: "underline",
};
