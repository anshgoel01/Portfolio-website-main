import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const About = () => {
  const { ref: aboutRef, isVisible: aboutVisible } = useScrollAnimation();

  const skills = {
    fullstack: [
      "React",
      "Node.js",
      "Express.js",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "MongoDB",
      "REST API Design",
    ],
    ml: [
      "C++",
      "Python",
      "TensorFlow",
      "PyTorch",
      "Scikit-learn",
      "NumPy",
      "Pandas",
      "Computer Vision",
      "Deep Learning",
    ],
    tools: [
      "Git",
      "GitHub",
      "Docker",
      "Postman",
      "Vite",
      "Vercel",
      "AWS",
    ],
  };

  return (
    <section id="about" ref={aboutRef} className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div className={`space-y-8 ${aboutVisible ? "scroll-animate" : ""}`}>
            <div>
              <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                About Me
              </p>
              <h2 className="text-5xl font-bold mb-8">My background</h2>
            </div>

            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                I'm a{" "}
                <span className="font-bold text-black dark:text-white">
                  Pre Final Year Student
                </span>{" "}
                at Thapar Institute of Engineering & Technology. I've gained
                hands-on experience as a Software Engineering Intern at
                SafeSpace, where I developed advanced multimodal stress
                detection systems.
              </p>

              <p>
                My work lies at the intersection of high-performance software
                engineering and applied AI. I've built distributed in-memory
                caches achieving 680k+ ops/sec and full-stack platforms like
                VerifyHub that automate verification for thousands of users. I
                am passionate about building scalable, secure, and intelligent
                systems.
              </p>

              <p>
                What truly drives me is solving real-world problems with
                measurable impact. Whether it's optimizing distributed systems,
                architecting secure platforms, or building AI models that
                enhance human well-being, I approach every challenge with
                precision, curiosity, and a strong focus on delivering results
                that matter.
              </p>
            </div>
          </div>

          {/* Right Content - Skills Card */}
          <div
            className={`glass-card rounded-3xl p-8 shadow-xl ${aboutVisible ? "scroll-animate scroll-animate-delay-2" : ""}`}
          >
            <h3 className="text-2xl font-bold mb-8">Skills & Expertise</h3>

            <div className="space-y-8">
              {/* Software & Full-Stack Development */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  Software & Full-Stack Development
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.fullstack.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-full text-sm font-medium border border-border hover:border-black dark:hover:border-white transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Machine Learning & Computer Vision */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  Machine Learning & Computer Vision
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.ml.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-full text-sm font-medium border border-border hover:border-black dark:hover:border-white transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Developer Tools & Ecosystem */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                  Developer Tools & Ecosystem
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((skill) => (
                    <span
                      key={skill}
                      className="px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-full text-sm font-medium border border-border hover:border-black dark:hover:border-white transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
