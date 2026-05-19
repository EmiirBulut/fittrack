import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Flex, Form, Input } from 'antd';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../router/routes';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'En az 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
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
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            size="large"
            block
          >
            Giriş Yap
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default LoginPage;
