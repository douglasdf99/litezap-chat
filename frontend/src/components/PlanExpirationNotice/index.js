import React from 'react';
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { Link } from 'react-router-dom';
import planExpiredImage from '../../assets/image-plan-blocked.png';

const PlanExpirationNotice = () => {
  return (
    <Container
      maxWidth="sm"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <img
        src={planExpiredImage}
        alt="Plano Expirado"
        style={{ width: '60%', height: 'auto', marginBottom: '20px' }}
      />
      <Typography variant="h4" gutterBottom>
        Plano Expirado
      </Typography>
      <Typography variant="body1" gutterBottom>
        Seu plano de assinatura expirou. Todas as suas conexões estão ativas e todos os seus dados estão seguros em nosso sistema. Para continuar aproveitando todos os nossos recursos, por favor, renove seu plano clicando no botão abaixo.
      </Typography>
      <Button
        component={Link}
        to="/financeiro"
        variant="contained"
        color="primary"
      >
        Renovar Plano
      </Button>
    </Container>
  );
};

export default PlanExpirationNotice;
