import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../app/store';
import './Signup.css';  // 👈 external stylesheet

// Define TypeScript type for the form fields
type FormValues = {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: string;
};

// Validation schema using Yup
const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 chars').required('Password is required'),
  phoneNumber: yup.string().optional(),
  role: yup.string().required('Role is required'),
}).required();

export default function Signup() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);



  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { role: 'RENTER' },
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
    const res = await dispatch(signup(data));

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
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Name</label>
            <input {...register('name')} />
            <span className="error">{errors.name?.message}</span>
          </div>

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

          <div className="form-group">
            <label>Phone Number</label>
            <input {...register('phoneNumber')} />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input {...register('role')} defaultValue="RENTER" />
            <span className="error">{errors.role?.message}</span>
          </div>

          {error && <div className="server-error">{error}</div>}

        <button type="submit" disabled={loading || isSubmitting}>
                {loading || isSubmitting ? 'Processing...' : 'Sign up'}
        </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
