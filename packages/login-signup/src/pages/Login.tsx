import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../app/store';
import './Login.css';

type FormValues = {
  email: string;
  password: string;
};

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
}).required();

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

 // inside component (Login or Signup)
const [isSubmitting, setIsSubmitting] = React.useState(false);

const onSubmit = async (data: any) => {
  // defensive: ignore empty payloads
  if (!data || (Object.keys(data).length === 0 && data.constructor === Object)) {
    console.warn('Ignored submit with empty payload');
    return;
  }

  // guard against double-clicks / double-invokes
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    // debug: see what we are sending
    console.debug('Submitting payload:', data);

    // dispatch the appropriate thunk
    // Login file: const res = await dispatch(login(data));
    // Signup file: const res = await dispatch(signup(data));
    const res = await dispatch(login(data));

    // handle result:
    if (res.type === 'auth/login/fulfilled') {
      navigate('/dashboard');
    } else if (res.type === 'auth/signup/fulfilled') {
      navigate('/login');
    } else {
      // optional: show res.payload for debugging
      console.warn('Thunk result:', res);
    }
  } catch (err) {
    console.error('submit error', err);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email</label>
            <input {...register('email')} />
            <span className="error">{errors.email?.message}</span>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" {...register('password')} />
            <span className="error">{errors.password?.message}</span>
          </div>

          {error && <div className="server-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
