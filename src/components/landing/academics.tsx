
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const ListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start">
        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
        <span>{children}</span>
    </li>
);

export default function Academics() {
    return (
        <section id="academics-info" className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-headline font-bold">🏫 Academics</h2>
            </div>
            <div className="space-y-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Our Academic Philosophy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            At Awadh Inter College, we believe that education is not just about learning facts, but about developing the skills, values, and mindset to succeed in life. Our academic program focuses on holistic development, blending classroom learning with real-world experiences to prepare students for future challenges.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Curriculum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Our curriculum is designed to promote critical thinking, creativity, and problem-solving. It follows the State Board guidelines while incorporating modern teaching methodologies and digital learning tools. We emphasize concept-based learning rather than rote memorization, ensuring that students understand the “why” behind every concept.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Teaching Methodology</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-muted-foreground">
                            <ListItem>Interactive classroom sessions</ListItem>
                            <ListItem>Smart classes with digital content</ListItem>
                            <ListItem>Group discussions and hands-on activities</ListItem>
                            <ListItem>Project-based and experiential learning</ListItem>
                            <ListItem>Regular assessments and feedback</ListItem>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Academic Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-muted-foreground">
                            <ListItem><strong>Pre-Primary (Nursery – KG):</strong> Learning through play, stories, and activities.</ListItem>
                            <ListItem><strong>Primary (Class I – V):</strong> Building a strong foundation in literacy, numeracy, and creativity.</ListItem>
                            <ListItem><strong>Middle (Class VI – VIII):</strong> Encouraging analytical thinking and scientific exploration.</ListItem>
                            <ListItem><strong>Secondary (Class IX – X):</strong> Focus on academic excellence, discipline, and career readiness.</ListItem>
                            <ListItem><strong>Senior Secondary (Class XI – XII):</strong> Offering specialized streams in Science, Commerce, and Humanities.</ListItem>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Assessment & Evaluation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            We follow a Continuous and Comprehensive Evaluation (CCE) system that assesses both scholastic and co-scholastic areas. Students are evaluated through class tests, term exams, assignments, projects, and participation in activities.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Beyond the Classroom</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Students participate in educational tours, science fairs, debates, quizzes, and various clubs that promote leadership, teamwork, and creativity.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">Our Commitment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-primary-foreground/80">
                            We are committed to maintaining a learning environment that is inclusive, innovative, and inspiring — where every child is encouraged to dream big and work hard to achieve their goals.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
