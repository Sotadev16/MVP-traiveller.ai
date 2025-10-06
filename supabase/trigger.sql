-- Database trigger to call Edge Function when new intake is inserted

-- Create the trigger function
CREATE OR REPLACE FUNCTION handle_new_intake()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function
  PERFORM
    net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/on-new-intake',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}',
      body := json_build_object('record', row_to_json(NEW))::text
    );

  -- Log the event
  INSERT INTO event_logs (event_type, intake_id, metadata)
  VALUES ('intake_submitted', NEW.id, json_build_object(
    'trigger_fired', true,
    'email_notification_attempted', true
  ));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_intake_inserted ON intakes;
CREATE TRIGGER on_intake_inserted
  AFTER INSERT ON intakes
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_intake();

-- Note: Replace 'your-project-ref' with your actual Supabase project reference