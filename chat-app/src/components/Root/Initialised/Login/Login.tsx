import { gql, useMutation } from "@apollo/client";
import {
  Card,
  Classes,
  Elevation,
  FormGroup,
  InputGroup,
  Intent,
  Button,
} from "@blueprintjs/core";
import { useForm } from "react-hook-form";
import { useRecoilState } from "recoil";
import styled from "styled-components";

import userSessionAtom from "#root/recoil/atoms/userSession";
import useGeneratedId from "#root/utils/hooks/forms/useGeneratedId";
import toaster from "#utils/misc/toaster";

interface FormData {
  password: string;
  username: string;
}

const Form = styled.form`
  margin: auto;
  width: 25rem;
`;

const Heading = styled.strong.attrs({ className: Classes.HEADING })`
  display: block;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
`;

// @ts-ignore
const LargeFormGroup = styled(FormGroup)`
  .bp3-label {
    font-size: 1rem;
  }
`;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const mutation = gql`
  mutation ($password: String!, $username: String!) {
    createUserSession(password: $password, username: $username) {
      user {
        username
      }
    }
  }
`;

const Login = () => {
  const { formState, handleSubmit, register, watch } = useForm<FormData>();
  const [createUserSession] = useMutation(mutation);
  const generateId = useGeneratedId();
  const [, setUserSession] = useRecoilState(userSessionAtom);

  const onSubmit = async ({ password, username }: FormData) => {
    try {
      const result = await createUserSession({
        variables: { password, username },
      });

      if (result.data.createUserSession)
        setUserSession(result.data.createUserSession);
    } catch (error) {
      toaster.show({ intent: Intent.DANGER, message: "Something went wrong" });
    }
  };

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Card elevation={Elevation.TWO}>
          <Heading>Chat App</Heading>
          <LargeFormGroup label="Username" labelFor={generateId("username")}>
            <InputGroup
              autoFocus
              disabled={formState.isSubmitting}
              id={generateId("username")}
              large
              {...register("username")}
            />
          </LargeFormGroup>
          <LargeFormGroup label="Password" labelFor={generateId("password")}>
            <InputGroup
              large
              disabled={formState.isSubmitting}
              type="password"
              id={generateId("password")}
              {...register("password")}
            />
          </LargeFormGroup>
          <Button
            intent={Intent.PRIMARY}
            large
            loading={formState.isSubmitting}
            type="submit"
          >
            Login
          </Button>
        </Card>
        <pre>{JSON.stringify(watch(), null, 2)}</pre>
      </Form>
    </Wrapper>
  );
};

export default Login;
