import { useState } from 'react';
import { supabase } from './supabaseClient';

function Auth() {
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github'
      });
      if (error) throw error;
      alert('oauth sign in with github');
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row flex-center flex">
      <div className="col-6 form-widget" aria-live="polite">
        <h1 className="header">Supabase + React</h1>
        <p className="description">Sign in via OAuth via GitHub below</p>
        {loading ? (
          'Logging in with GitHub'
        ) : (
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <button className="button block" aria-live="polite">
              Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Auth;
