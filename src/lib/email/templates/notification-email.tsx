import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import { ReactElement } from 'react';

interface NotificationEmailProps {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export function NotificationEmail({
  title,
  message,
  actionUrl,
  actionText
}: NotificationEmailProps): ReactElement {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{title}</Heading>
          <Text style={text}>{message}</Text>
          {actionUrl && actionText && (
            <Text style={buttonContainer}>
              <a href={actionUrl} style={button}>
                {actionText}
              </a>
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
};

const text = {
  margin: '0 0 10px',
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
};

const buttonContainer = {
  padding: '27px 0 27px',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '10px',
}; 