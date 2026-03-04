import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Font,
} from "@react-email/components";
import * as React from "react";

interface NewPostEmailProps {
    postTitle: string;
    postExcerpt: string;
    postUrl: string;
    coverImage?: string;
    authorName: string;
}

export const NewPostEmail = ({
    postTitle = "Designing a Modern Backend System",
    postExcerpt = "A breakdown of the architectural decisions, trade-offs, and debugging lessons behind building a reliable backend system.",
    postUrl = "https://yourblog.com/blog/designing-modern-blog",
    coverImage,
    authorName = "Atharv Singh",
}: NewPostEmailProps) => {
    const previewText = `${postTitle} — Not a Blogger`;

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
                        <img src="https://images.atharvsingh.me/cta/New%20Post%20header.svg" alt="Not a Blogger" className="header-logo"></img>
                        <Text style={authorLineTitle}>
                            I break systems so you don't have to.
                        </Text>
                        <Text style={authorLineSubtitle}>
                            Notes on backend, systems, and things I build when I'm bored of tutorials.
                        </Text>
                    </Section>

                    <Hr style={divider} />

                    {/* Content */}
                    <Section style={contentSection}>
                        {coverImage && (
                            <Img
                                src={coverImage}
                                width="100%"
                                alt="Post Cover"
                                style={coverImageStyle}
                            />
                        )}

                        <Heading as="h2" style={postTitleStyle}>
                            {postTitle}
                        </Heading>

                        <Text style={postExcerptStyle}>
                            {postExcerpt}
                        </Text>

                        <Section style={buttonContainer}>
                            <Button style={button} href={postUrl}>
                                Read the full post →
                            </Button>
                        </Section>
                    </Section>

                    <Hr style={divider} />

                    {/* Footer */}
                    <Section style={footerSection}>
                        <img src="https://images.atharvsingh.me/cta/Atharv%20Singh.svg" alt="Atharv Singh" className="footer-name"></img>
                        <br></br>
                        <img src="https://images.atharvsingh.me/cta/blogs.atharvsingh.me.svg" alt="blogs.atharvsingh.me" className="footer-site"></img>
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

export default NewPostEmail;

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

const coverImageStyle = {
    marginBottom: "24px",
};

const postTitleStyle = {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: "26px",
    fontWeight: "600",
    color: "#111111",
    margin: "0 0 16px 0",
    lineHeight: "1.3",
};

const postExcerptStyle = {
    fontFamily: '"Inter", sans-serif',
    fontSize: "16px",
    color: "#444444",
    lineHeight: "1.7",
    margin: "0 0 24px 0",
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
