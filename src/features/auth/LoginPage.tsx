import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Flex, Form, Input, Typography } from 'antd';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../router/routes';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'En az 6 karakter'),
});

const signupSchema = loginSchema
  .extend({
    passwordConfirm: z.string().min(6, 'En az 6 karakter'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Şifreler eşleşmiyor',
    path: ['passwordConfirm'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
  });

  const toggleMode = () => {
    setIsSignup((prev) => !prev);
    setErrorMessage(null);
    setSuccessMessage(null);
    reset();
  };

  const onSubmit = async (values: SignupFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      if (error) {
        setErrorMessage('Kayıt başarısız. Bu e-posta zaten kayıtlı olabilir.');
        return;
      }
      setSuccessMessage('Kayıt başarılı! E-posta adresinizi doğrulayın, ardından giriş yapın.');
      setIsSignup(false);
      reset();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setErrorMessage('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
      return;
    }
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <Flex vertical gap={16}>
      {errorMessage && (
        <Alert type="error" message={errorMessage} showIcon closable />
      )}
      {successMessage && (
        <Alert type="success" message={successMessage} showIcon />
      )}
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="E-posta"
          validateStatus={errors.email ? 'error' : ''}
          help={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="ornek@email.com" size="large" />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Şifre"
          validateStatus={errors.password ? 'error' : ''}
          help={errors.password?.message}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input.Password {...field} placeholder="En az 6 karakter" size="large" />
            )}
          />
        </Form.Item>
        {isSignup && (
          <Form.Item
            label="Şifre Tekrar"
            validateStatus={errors.passwordConfirm ? 'error' : ''}
            help={errors.passwordConfirm?.message}
          >
            <Controller
              name="passwordConfirm"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} placeholder="Şifrenizi tekrar girin" size="large" />
              )}
            />
          </Form.Item>
        )}
        <Form.Item style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            size="large"
            block
          >
            {isSignup ? 'Kayıt Ol' : 'Giriş Yap'}
          </Button>
        </Form.Item>
      </Form>
      <Flex justify="center">
        <Typography.Text type="secondary">
          {isSignup ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}{' '}
          <Typography.Link onClick={toggleMode}>
            {isSignup ? 'Giriş Yap' : 'Kayıt Ol'}
          </Typography.Link>
        </Typography.Text>
      </Flex>
    </Flex>
  );
};

export default LoginPage;
