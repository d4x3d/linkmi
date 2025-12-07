import * as React from 'react';
import { Html, Button, Body, Container, Text, Heading, Hr, Head, Preview } from '@react-email/components';

interface PurchaseEmailProps {
  productName: string;
  downloadUrl?: string | null;
  deliveryNote?: string | null;
}

export function PurchaseEmail({ productName, downloadUrl, deliveryNote }: PurchaseEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your purchase of {productName} is ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Thanks for your purchase!</Heading>
          <Text style={paragraph}>
            You have successfully purchased <strong>{productName}</strong>.
            {downloadUrl ? ' Click the button below to access your content.' : ''}
          </Text>

          {deliveryNote && (
            <div style={noteContainer}>
              <Text style={noteLabel}>Note from creator:</Text>
              <Text style={noteText}>&quot;{deliveryNote}&quot;</Text>
            </div>
          )}

          {downloadUrl && (
            <div style={btnContainer}>
              <Button href={downloadUrl} style={button}>
                Access Content
              </Button>
            </div>
          )}

          <Hr style={hr} />
          <Text style={footer}>Powered by LinkMi</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  marginTop: '20px',
  marginBottom: '20px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
  textAlign: 'center' as const,
};

const paragraph = {
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
  padding: '0 40px',
};

const noteContainer = {
  padding: '15px 40px',
  backgroundColor: '#f9f9f9',
  marginBottom: '20px',
};

const noteLabel = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#888',
  marginBottom: '5px',
  textTransform: 'uppercase' as const,
};

const noteText = {
  fontSize: '14px',
  fontStyle: 'italic',
  color: '#555',
  margin: '0',
};

const btnContainer = {
  textAlign: 'center' as const,
  padding: '20px',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
};

const footer = {
  color: '#9ca299',
  fontSize: '12px',
  marginBottom: '20px',
  textAlign: 'center' as const,
};
