import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Row,
    Column,
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
    const greeting = subscriberName ? `Welcome, ${subscriberName}.` : "Welcome.";

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
            </Head>
            <Preview>Welcome to Not a Blogger</Preview>
            <Body style={main}>
                <Container style={container}>

                    {/* System message header — table layout for alignment */}
                    <Section style={{ marginBottom: "16px" }}>

                    </Section>

                    <Hr style={divider} />

                    {/* Hero */}
                    <Section style={heroWrap}>
                        <Heading style={hero}>You are in.</Heading>
                    </Section>

                    <Hr style={divider} />

                    {/* Identity block */}
                    <Section style={section}>
                        <Text style={authorTagline}>
                            I break systems so you don't have to.
                        </Text>
                        <Text style={authorSub}>
                            Notes on backend, systems, and things I build when I'm bored of tutorials.
                        </Text>
                        <Text style={signature}>
                            <strong style={{ color: "#111111", fontWeight: 500 }}>{authorName}</strong>
                            {"\n"}
                            <span style={signatureAside}>(not a blogger)</span>
                        </Text>
                    </Section>

                    <Hr style={divider} />

                    {/* Body */}
                    <Section style={section}>
                        <Heading as="h2" style={welcomeHeading}>{greeting}</Heading>

                        <Text style={paragraph}>
                            Thanks for subscribing to <strong>Not a Blogger</strong>. You are now on the list to receive my latest writings on backend systems, architectural trade-offs, and deliberate engineering.
                        </Text>

                        <Text style={paragraph}>
                            I don't publish on a strict schedule. I only hit send when I have something meaningful to say. Usually deep dives into technical choices, hard-learned lessons from production, or essays on software design.
                        </Text>

                        <Text style={paragraph}>
                            You will receive the next essay as soon as it's published. Until then, the archive is open.
                        </Text>

                        <Link href="https://blogs.atharvsingh.me" style={cta}>
                            Explore the archive &rarr;
                        </Link>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerRule}>&mdash;</Text>
                        <Text style={footerName}>{authorName}</Text>
                        <Text style={footerSite}>blogs.atharvsingh.me</Text>
                        <Text style={footerNote}>
                            You received this because you subscribed to Not a Blogger.
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
    backgroundColor: "#fafafa",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "48px 0",
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "600px",
    padding: "52px 48px",
};

const metaKey = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: "13px",
    color: "#b0b0b0",
    paddingRight: "20px",
    lineHeight: "1.8",
    whiteSpace: "nowrap" as const,
    verticalAlign: "top" as const,
};

const metaVal = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: "13px",
    color: "#6b6b6b",
    lineHeight: "1.8",
};

const divider = {
    borderTop: "1px solid #e8e8e8",
    borderBottom: "none",
    margin: "0",
};

const heroWrap = {
    padding: "44px 0 44px 24px",
};

const hero = {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: "64px",
    fontWeight: "600",
    color: "#111111",
    margin: "0",
    lineHeight: "1.0",
    letterSpacing: "-0.02em",
};

const section = {
    padding: "36px 0",
};

const label = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#888888",
    margin: "0 0 20px 0",
};

const authorTagline = {
    fontSize: "16px",
    color: "#333333",
    margin: "0 0 8px 0",
    lineHeight: "1.5",
};

const authorSub = {
    fontSize: "13px",
    color: "#999999",
    margin: "0 0 24px 0",
    lineHeight: "1.6",
};

const signature = {
    fontSize: "14px",
    color: "#555555",
    margin: "0",
    lineHeight: "1.8",
};

const signatureAside = {
    fontSize: "13px",
    color: "#999999",
};

const welcomeHeading = {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: "22px",
    fontWeight: "400",
    color: "#111111",
    margin: "0 0 24px 0",
    lineHeight: "1.3",
};

const paragraph = {
    fontSize: "16px",
    color: "#444444",
    lineHeight: "1.75",
    margin: "0 0 18px 0",
    maxWidth: "540px",
};

const cta = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: "13px",
    color: "#111111",
    textDecoration: "none",
    display: "inline-block",
    marginTop: "16px",
    borderBottom: "1px solid #111111",
    paddingBottom: "2px",
};

const footer = {
    paddingTop: "36px",
    borderTop: "1px solid #e8e8e8",
};

const footerRule = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: "13px",
    color: "#bbbbbb",
    margin: "0 0 16px 0",
};

const footerName = {
    fontSize: "14px",
    color: "#555555",
    margin: "0 0 4px 0",
};

const footerSite = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: "12px",
    color: "#999999",
    margin: "0 0 20px 0",
};

const footerNote = {
    fontSize: "12px",
    color: "#aaaaaa",
    lineHeight: "1.6",
    margin: "0 0 8px 0",
};

const footerLink = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: "12px",
    color: "#888888",
    textDecoration: "underline",
};
