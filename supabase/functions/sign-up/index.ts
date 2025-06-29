// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
Deno.serve(async (req)=>{
  if (req.method !== 'POST') {
    console.error('Method Not Allowed:', req.method);
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }
  try {
    const payload = await req.json();
    const { name, email, password, identityCard, isStaff, user_type, division_id, phone_number, address, profile_pic } = payload;
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // Basic validation
    if (!name || name.length < 2) {
      console.error('Invalid name:', name);
      return new Response(JSON.stringify({ error: 'Invalid name' }), { status: 400 });
    }
    if (!identityCard || !/^[a-zA-Z0-9]{12}$/.test(identityCard)) {
      console.error('Invalid identity card:', identityCard);
      return new Response(JSON.stringify({ error: 'Invalid identity card' }), { status: 400 });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      console.error('Invalid email:', email);
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
    }
    if (!password || password.length < 6) {
      console.error('Invalid password');
      return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 400 });
    }
    if (!user_type) {
      console.error('Missing user_type');
      return new Response(JSON.stringify({ error: 'Missing user_type' }), { status: 400 });
    }

    // Calculate age from identityCard (first 6 digits: yymmdd)
    const birth = identityCard.substring(0, 6);
    let year = parseInt(birth.substring(0, 2), 10);
    const month = parseInt(birth.substring(2, 4), 10);
    const day = parseInt(birth.substring(4, 6), 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      console.error('Invalid birth date in identity card:', birth);
      return new Response(JSON.stringify({ error: 'Invalid birth date in identity card' }), { status: 400 });
    }
    year += year < 30 ? 2000 : 1900;
    const birthDate = new Date(year, month - 1, day);
    if (isNaN(birthDate.getTime())) {
      console.error('Invalid birth date in identity card:', birthDate);
      return new Response(JSON.stringify({ error: 'Invalid birth date in identity card' }), { status: 400 });
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 1 || age > 120) {
      console.error('Calculated age is not valid:', age);
      return new Response(JSON.stringify({ error: 'Calculated age is not valid' }), { status: 400 });
    }

    // Check if email exists in auth.users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers({ email });
    if (userError) {
      console.error('Supabase listUsers error:', userError);
      return new Response(JSON.stringify({ error: userError.message }), { status: 500 });
    }
    if (users && users.length > 0) {
      console.error('Email already exists:', email);
      return new Response(JSON.stringify({ error: 'Email already exists' }), { status: 409 });
    }

    // Set status
    const status = isStaff ? 'pending' : 'verified';

    // Sign up with Supabase Auth (get auth_user_id)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { name, identityCard, isStaff, age, user_type, division_id, phone_number, address, profile_pic },
    });
    if (authError || !authUser || !authUser.user) {
      console.error('Supabase createUser error:', authError);
      return new Response(JSON.stringify({ error: authError?.message || 'Failed to create auth user' }), { status: 500 });
    }
    const auth_user_id = authUser.user.id;

    // Create user_account
    const { error: accountError } = await supabase
      .from('user_account')
      .insert({
        auth_user_id,
        user_type,
        division_id: division_id || null,
        status
      });
    if (accountError) {
      console.error('Insert user_account error:', accountError);
      // Rollback: delete Auth user
      await supabase.auth.admin.deleteUser(auth_user_id);
      return new Response(JSON.stringify({ error: accountError.message }), { status: 500 });
    }

    // Create profile_details
    const { error: profileError } = await supabase
      .from('profile_details')
      .insert({
        auth_user_id,
        name,
        identity_card_num: identityCard,
        age,
        phone_number: phone_number || null,
        address: address || null,
        profile_pic: profile_pic || null
      });
    if (profileError) {
      console.error('Insert profile_details error:', profileError);
      // Rollback: delete Auth user
      await supabase.auth.admin.deleteUser(auth_user_id);
      // Rollback: delete user_account
      await supabase
        .from('user_account')
        .delete()
        .eq('auth_user_id', auth_user_id);
      return new Response(JSON.stringify({ error: profileError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Check verification email' }), { status: 200 });
  } catch (err) {
    console.error('Unhandled error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});