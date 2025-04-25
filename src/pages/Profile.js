import React, { useState, useEffect, useContext } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import AuthContext from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.user?.name || "",
    email: user?.user?.email || "",
    phone: user?.user?.phone || "",
    linkedInUrl: user?.user?.linkedInUrl || "",
    defaultMeetingLink: user?.user?.defaultMeetingLink || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    workExperiences: user?.user?.workExperiences || [],
    education: user?.user?.education || [],
  });

  // State for new work experience and education entries
  const [newWorkExperience, setNewWorkExperience] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const [newEducation, setNewEducation] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
    current: false,
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);

  useEffect(() => {
    if (user?.user) {
      setFormData({
        name: user.user.name || "",
        email: user.user.email || "",
        phone: user.user.phone || "",
        linkedInUrl: user.user.linkedInUrl || "",
        defaultMeetingLink: user.user.defaultMeetingLink || "",
        workExperiences: user.user.workExperiences || [],
        education: user.user.education || [],
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Prepare data for update
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        linkedInUrl: formData.linkedInUrl,
        defaultMeetingLink: formData.defaultMeetingLink,
        workExperiences: formData.workExperiences,
        education: formData.education,
      };

      // Add password fields if in password change mode
      if (passwordChangeMode) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("New passwords do not match");
          setLoading(false);
          return;
        }

        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await api.put("/api/users/profile", updateData);

      // Update user in context
      updateProfile(response.data);

      toast.success("Profile updated successfully");

      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordChangeMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1>Your Profile</h1>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h2>Personal Information</h2>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled-input"
            />
            <small>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="linkedInUrl">LinkedIn Profile URL</label>
            <input
              type="url"
              id="linkedInUrl"
              name="linkedInUrl"
              value={formData.linkedInUrl}
              onChange={handleChange}
              placeholder="https://www.linkedin.com/in/yourprofile"
            />
            <small>
              Share your LinkedIn profile to connect with interviewers
            </small>
          </div>

          {/* Only show default meeting link field for interviewers */}
          {user?.user?.role === "interviewer" && (
            <div className="form-group">
              <label htmlFor="defaultMeetingLink">Default Meeting Link</label>
              <input
                type="url"
                id="defaultMeetingLink"
                name="defaultMeetingLink"
                value={formData.defaultMeetingLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
              />
              <small>
                This link will be used for all your interviews. Use Google Meet,
                Zoom, or any other video conferencing tool.
              </small>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="password-section-header">
            <h2>Password</h2>
            {!passwordChangeMode && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPasswordChangeMode(true)}
              >
                Change Password
              </button>
            )}
          </div>

          {passwordChangeMode && (
            <>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setPasswordChangeMode(false);
                  setFormData({
                    ...formData,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                Cancel Password Change
              </button>
            </>
          )}
        </div>

        {/* Work Experience Section */}
        <div className="form-section">
          <h2>Work Experience</h2>

          {formData.workExperiences && formData.workExperiences.length > 0 ? (
            <div className="experience-list">
              {formData.workExperiences.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    <h3>
                      {exp.company} - {exp.position}
                    </h3>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => {
                        const updatedExperiences = [...formData.workExperiences];
                        updatedExperiences.splice(index, 1);
                        setFormData({
                          ...formData,
                          workExperiences: updatedExperiences,
                        });
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <p>
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} -
                    {exp.current
                      ? "Present"
                      : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : '')}
                  </p>
                  <p>{exp.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-items-message">No work experience added yet.</p>
          )}

          {/* Add New Work Experience Form */}
          <div className="add-experience-form">
            <h3>Add New Work Experience</h3>
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={newWorkExperience.company}
                onChange={(e) =>
                  setNewWorkExperience({
                    ...newWorkExperience,
                    company: e.target.value,
                  })
                }
                placeholder="Company name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={newWorkExperience.position}
                onChange={(e) =>
                  setNewWorkExperience({
                    ...newWorkExperience,
                    position: e.target.value,
                  })
                }
                placeholder="Job title"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={newWorkExperience.startDate}
                  onChange={(e) =>
                    setNewWorkExperience({
                      ...newWorkExperience,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={newWorkExperience.endDate}
                  onChange={(e) =>
                    setNewWorkExperience({
                      ...newWorkExperience,
                      endDate: e.target.value,
                    })
                  }
                  disabled={newWorkExperience.current}
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="currentJob"
                name="currentJob"
                checked={newWorkExperience.current}
                onChange={(e) =>
                  setNewWorkExperience({
                    ...newWorkExperience,
                    current: e.target.checked,
                    endDate: e.target.checked ? "" : newWorkExperience.endDate,
                  })
                }
              />
              <label htmlFor="currentJob">I currently work here</label>
            </div>

            <div className="form-group">
              <label htmlFor="jobDescription">Description</label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={newWorkExperience.description}
                onChange={(e) =>
                  setNewWorkExperience({
                    ...newWorkExperience,
                    description: e.target.value,
                  })
                }
                placeholder="Describe your responsibilities and achievements"
                rows="3"
              ></textarea>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                // Validate required fields
                if (
                  !newWorkExperience.company ||
                  !newWorkExperience.position ||
                  !newWorkExperience.startDate
                ) {
                  toast.error("Please fill in all required fields");
                  return;
                }

                // Add new experience to the list
                setFormData({
                  ...formData,
                  workExperiences: [
                    ...formData.workExperiences,
                    newWorkExperience,
                  ],
                });

                // Reset form
                setNewWorkExperience({
                  company: "",
                  position: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  description: "",
                });
              }}
            >
              Add Experience
            </button>
          </div>
        </div>

        {/* Education Section */}
        <div className="form-section">
          <h2>Education</h2>

          {formData.education && formData.education.length > 0 ? (
            <div className="education-list">
              {formData.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    <h3>
                      {edu.school} - {edu.degree}
                    </h3>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => {
                        const updatedEducation = [...formData.education];
                        updatedEducation.splice(index, 1);
                        setFormData({
                          ...formData,
                          education: updatedEducation,
                        });
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <p>
                    {edu.startYear} - {edu.current ? "Present" : edu.endYear}
                    {edu.fieldOfStudy ? ` • ${edu.fieldOfStudy}` : ""}
                  </p>
                  <p>{edu.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-items-message">No education history added yet.</p>
          )}

          {/* Add New Education Form */}
          <div className="add-education-form">
            <h3>Add New Education</h3>
            <div className="form-group">
              <label htmlFor="school">School/University</label>
              <input
                type="text"
                id="school"
                name="school"
                value={newEducation.school}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    school: e.target.value,
                  })
                }
                placeholder="School or university name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="degree">Degree</label>
              <input
                type="text"
                id="degree"
                name="degree"
                value={newEducation.degree}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    degree: e.target.value,
                  })
                }
                placeholder="e.g., Bachelor of Science"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fieldOfStudy">Field of Study</label>
              <input
                type="text"
                id="fieldOfStudy"
                name="fieldOfStudy"
                value={newEducation.fieldOfStudy}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    fieldOfStudy: e.target.value,
                  })
                }
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startYear">Start Year</label>
                <input
                  type="number"
                  id="startYear"
                  name="startYear"
                  value={newEducation.startYear}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      startYear: e.target.value,
                    })
                  }
                  min="1900"
                  max="2099"
                  step="1"
                  placeholder="YYYY"
                />
              </div>

              <div className="form-group">
                <label htmlFor="endYear">End Year</label>
                <input
                  type="number"
                  id="endYear"
                  name="endYear"
                  value={newEducation.endYear}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      endYear: e.target.value,
                    })
                  }
                  min="1900"
                  max="2099"
                  step="1"
                  placeholder="YYYY"
                  disabled={newEducation.current}
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="currentEducation"
                name="currentEducation"
                checked={newEducation.current}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    current: e.target.checked,
                    endYear: e.target.checked ? "" : newEducation.endYear,
                  })
                }
              />
              <label htmlFor="currentEducation">
                I'm currently studying here
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="educationDescription">Description</label>
              <textarea
                id="educationDescription"
                name="educationDescription"
                value={newEducation.description}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    description: e.target.value,
                  })
                }
                placeholder="Describe your studies, achievements, etc."
                rows="3"
              ></textarea>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                // Validate required fields
                if (
                  !newEducation.school ||
                  !newEducation.degree ||
                  !newEducation.startYear
                ) {
                  toast.error("Please fill in all required fields");
                  return;
                }

                // Add new education to the list
                setFormData({
                  ...formData,
                  education: [...formData.education, newEducation],
                });

                // Reset form
                setNewEducation({
                  school: "",
                  degree: "",
                  fieldOfStudy: "",
                  startYear: "",
                  endYear: "",
                  current: false,
                  description: "",
                });
              }}
            >
              Add Education
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
