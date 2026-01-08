import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, Text, Flex } from "@radix-ui/themes";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = { hasError: false };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <Card size="2" style={{ border: '1px solid var(--red-5)', backgroundColor: 'var(--red-1)' }}>
                    <Flex align="center" justify="center" height="60px">
                        <Text color="red" size="2">Failed to load node data.</Text>
                    </Flex>
                </Card>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;